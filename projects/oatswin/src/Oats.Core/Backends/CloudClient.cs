using System.Net;

namespace Oats.Core.Backends;

public sealed class CloudException(string message, Exception? inner = null) : Exception(message, inner);

/// <summary>HTTP with retries on 429/5xx and plain-English errors. One shared <see cref="HttpClient"/> per process.</summary>
public static class CloudClient
{
    public static readonly HttpClient Http = new() { Timeout = TimeSpan.FromMinutes(10) };

    public static async Task<string> SendAsync(Func<HttpRequestMessage> makeRequest, string backend, CancellationToken ct)
    {
        for (int attempt = 1; ; attempt++)
        {
            HttpResponseMessage response;
            try
            {
                using var request = makeRequest();
                response = await Http.SendAsync(request, ct);
            }
            catch (HttpRequestException e) when (attempt < 3)
            {
                await Task.Delay(TimeSpan.FromSeconds(2 * attempt), ct);
                _ = e;
                continue;
            }
            catch (HttpRequestException e)
            {
                throw new CloudException($"Couldn't reach {backend}: {e.Message}", e);
            }
            catch (TaskCanceledException e) when (!ct.IsCancellationRequested)
            {
                throw new CloudException($"{backend} took too long to answer.", e);
            }

            using (response)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                if (response.IsSuccessStatusCode) return body;
                var code = (int)response.StatusCode;
                if ((code == 429 || code >= 500) && attempt < 3)
                {
                    var wait = response.Headers.RetryAfter?.Delta ?? TimeSpan.FromSeconds(3 * attempt);
                    await Task.Delay(wait > TimeSpan.FromSeconds(60) ? TimeSpan.FromSeconds(60) : wait, ct);
                    continue;
                }
                var detail = body.Length > 400 ? body[..400] + "..." : body;
                throw response.StatusCode switch
                {
                    HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden =>
                        new CloudException($"{backend} rejected the API key ({code}). Check the key in Settings."),
                    HttpStatusCode.NotFound => new CloudException($"{backend} doesn't know that address or model (404). {detail}"),
                    HttpStatusCode.RequestEntityTooLarge => new CloudException($"{backend} said the audio is too large (413)."),
                    _ => new CloudException($"{backend} returned {code}. {detail}"),
                };
            }
        }
    }

    public static string HostOf(string address) =>
        Uri.TryCreate(address, UriKind.Absolute, out var u) ? u.Host : address;
}
