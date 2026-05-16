namespace HomeDecorShop.Application;

public sealed record FeedbackView(
    int FeedbackId,
    string Name,
    string Email,
    string Message,
    DateTime CreatedAt);
