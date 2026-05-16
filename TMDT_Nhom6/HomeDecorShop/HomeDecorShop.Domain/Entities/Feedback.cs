namespace HomeDecorShop.Domain;

public sealed record Feedback(
    int FeedbackId,
    string Name,
    string Email,
    string Message,
    DateTime CreatedAt);
