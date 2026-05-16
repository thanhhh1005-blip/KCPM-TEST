namespace HomeDecorShop.Application;

public interface IFeedbackService
{
    IReadOnlyCollection<FeedbackView> GetAll();
    FeedbackView? GetById(int feedbackId);
    FeedbackView Create(FeedbackUpsertInput input);
    FeedbackView? Update(int feedbackId, FeedbackUpsertInput input);
    bool Delete(int feedbackId);
}
