using Anthropic;
using Anthropic.Models.Beta.Messages;

namespace Oats.Core.Backends;

/// <summary>
/// The Anthropic Notes backend, through the official Anthropic C# SDK. Uses the server-side refusal fallback so a
/// rare safety-classifier refusal on a meeting transcript is retried on a fallback model instead of failing the Notes.
/// </summary>
public sealed class AnthropicNotes : INotesBackend
{
    public const string DefaultModel = "claude-opus-5-5";

    readonly IAnthropicClient client;

    public AnthropicNotes(string? address, string? model, string? apiKey, int contextTokens = 200_000)
    {
        if (string.IsNullOrWhiteSpace(apiKey)) throw new CloudException("Anthropic needs an API key. Add it in Settings > AI.");
        Model = string.IsNullOrWhiteSpace(model) ? DefaultModel : model.Trim();
        ContextTokens = contextTokens;
        IAnthropicClient c = new AnthropicClient { ApiKey = apiKey.Trim() };
        var baseUrl = NormalizeBaseUrl(address);
        client = baseUrl is null ? c : c.WithOptions(o => o with { BaseUrl = baseUrl });
    }

    public string Model { get; }
    public int ContextTokens { get; }
    public string Name => $"anthropic:{Model}";

    /// <summary>Accepts <c>host</c>, <c>host/v1</c> or the full <c>.../v1/messages</c>; null keeps the SDK default.</summary>
    public static string? NormalizeBaseUrl(string? address)
    {
        if (string.IsNullOrWhiteSpace(address)) return null;
        var s = address.Trim().TrimEnd('/');
        foreach (var suffix in new[] { "/messages", "/v1" })
            if (s.EndsWith(suffix, StringComparison.Ordinal)) s = s[..^suffix.Length];
        return s == "https://api.anthropic.com" ? null : s;
    }

    public async Task<string> CompleteAsync(string system, string user, CancellationToken ct)
    {
        BetaMessage message;
        try
        {
            message = await client.Beta.Messages.Create(new MessageCreateParams
            {
                Model = Model,
                MaxTokens = 16_000,
                System = system,
                Messages = [new BetaUserMessageParam { Content = user }],
                Betas = ["server-side-fallback-2026-07-01"],
                Fallbacks = new Default(),
            }, ct);
        }
        catch (Exception e) when (e is not OperationCanceledException)
        {
            throw new CloudException($"Anthropic: {e.Message}", e);
        }

        if (message.StopReason == BetaStopReason.Refusal)
            throw new CloudException("Anthropic declined to write notes for this transcript (refusal).");
        var text = string.Concat(message.Content.Select(b => b.Value).OfType<BetaTextBlock>().Select(t => t.Text)).Trim();
        return text.Length == 0 ? throw new NotesEmptyException() : text;
    }
}
