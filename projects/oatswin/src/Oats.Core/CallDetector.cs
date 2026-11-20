namespace Oats.Core;

public enum CallEvent { Started, Ended }

/// <summary>
/// Turns "is the call app on the microphone?" samples into call start and end events. A call starts once the app has
/// held the mic for <see cref="StartAfter"/> (so a quick mic test or a voice message doesn't count) and ends once it has
/// left the mic for <see cref="EndAfter"/> (so a brief mute toggle or device switch doesn't end the recording).
/// </summary>
public sealed class CallDetector
{
    public TimeSpan StartAfter { get; init; } = TimeSpan.FromSeconds(5);
    public TimeSpan EndAfter { get; init; } = TimeSpan.FromSeconds(20);

    DateTimeOffset? onSince, offSince;

    public bool InCall { get; private set; }

    public CallEvent? Update(bool appOnMic, DateTimeOffset now)
    {
        if (appOnMic)
        {
            offSince = null;
            onSince ??= now;
            if (!InCall && now - onSince >= StartAfter)
            {
                InCall = true;
                return CallEvent.Started;
            }
        }
        else
        {
            onSince = null;
            if (InCall)
            {
                offSince ??= now;
                if (now - offSince >= EndAfter)
                {
                    InCall = false;
                    offSince = null;
                    return CallEvent.Ended;
                }
            }
        }
        return null;
    }
}
