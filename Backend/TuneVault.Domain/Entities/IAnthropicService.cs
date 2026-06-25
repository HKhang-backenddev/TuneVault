using System.Threading.Tasks;

namespace TuneVault.Application.Common;

public interface IAnthropicService
{
    Task<string> GetAiSuggestionAsync(string prompt);
}