using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Oats.Core.Backends;

/// <summary>
/// <c>POST .../chat/completions</c>: OpenAI, OpenRouter, Gemini's OpenAI endpoint, LM Studio, llama.cpp, custom servers.
/// Ollama (port 11434) gets its native <c>/api/chat</c>, the only way to set its context size: its <c>/v1</c> silently
/// cuts prompts at the default context.
/// </summary>
public sealed class OpenAICompatibleNotes(string address, string? model, string? apiKey, int contextTokens = 32_000) : INotesBackend
{
    public string Address { get; } = address;
    public string? Model { get; } = string.IsNullOrWhiteSpace(model) ? null : model.Trim();
    public string? ApiKey { get; } = string.IsNullOrWhiteSpace(apiKey) ? null : apiKey.Trim();
    public int ContextTokens { get; } = contextTokens;
    public string Name => $"openai-compatible:{Model ?? CloudClient.HostOf(Address)}";

    /// <summary>Accepts every pasted variant: <c>host</c>, <c>host/v1</c>, <c>host/v1/</c> or the full <c>.../chat/completions</c>.</summary>
    public (Uri Url, bool Ollama)? Endpoint()
    {
        var s = Address.Trim();
        if (!Uri.TryCreate(s, UriKind.Absolute, out var uri) || !uri.Scheme.StartsWith("http", StringComparison.Ordinal)) return null;
        if (uri.Port == 11434) return (new UriBuilder(uri) { Path = "/api/chat" }.Uri, true);
        s = s.TrimEnd('/');
        if (!s.EndsWith("/chat/completions", StringComparison.Ordinal))
        {
            if (!s.EndsWith("/v1", StringComparison.Ordinal) && !s.EndsWith("/openai", StringComparison.Ordinal)) s += "/v1";
            s += "/chat/completions";
        }
        return (new Uri(s), false);
    }

    public async Task<string> CompleteAsync(string system, string user, CancellationToken ct)
    {
        var endpoint = Endpoint() ?? throw new CloudException($"\"{Address}\" isn't a valid server address.");
        var backend = endpoint.Ollama ? "Ollama" : endpoint.Url.Host;
        var body = new JsonObject
        {
            ["messages"] = new JsonArray(
                new JsonObject { ["role"] = "system", ["content"] = system },
                new JsonObject { ["role"] = "user", ["content"] = user }),
            ["stream"] = false,
        };
        if (Model is not null) body["model"] = Model;
        if (endpoint.Ollama)
        {
            // Notes don't need a thinking model's reasoning; skipping it saves minutes on a laptop.
            body["options"] = new JsonObject { ["num_ctx"] = ContextTokens };
            body["think"] = false;
        }
        var json = body.ToJsonString();
        var reply = await CloudClient.SendAsync(() =>
        {
            var request = new HttpRequestMessage(HttpMethod.Post, endpoint.Url)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json"),
            };
            if (ApiKey is not null) request.Headers.Authorization = new("Bearer", ApiKey);
            if (endpoint.Url.Host.EndsWith("openrouter.ai", StringComparison.Ordinal))
            {
                request.Headers.Add("HTTP-Referer", "https://github.com/yazinsai/OpenOats");
                request.Headers.Add("X-Title", "OatsWin");
            }
            return request;
        }, backend, ct);

        JsonNode? message;
        try
        {
            var root = JsonNode.Parse(reply);
            message = endpoint.Ollama ? root?["message"] : root?["choices"]?[0]?["message"];
        }
        catch (JsonException e) { throw new CloudException($"{backend} sent a reply that isn't JSON.", e); }
        var text = message?["content"]?.GetValue<string>() ?? throw new CloudException($"{backend} sent an unexpected reply.");
        var trimmed = text.Trim();
        if (trimmed.StartsWith("<think>", StringComparison.Ordinal) && trimmed.IndexOf("</think>", StringComparison.Ordinal) is var end and >= 0)
            trimmed = trimmed[(end + "</think>".Length)..].Trim();
        return trimmed.Length == 0 ? throw new NotesEmptyException() : trimmed;
    }
}
