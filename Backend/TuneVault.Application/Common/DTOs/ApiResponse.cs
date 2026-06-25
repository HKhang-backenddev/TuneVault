namespace TuneVault.Application.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public List<string> Errors { get; set; } = new();

    public ApiResponse(T data)
    {
        Success = true;
        Data = data;
    }

    public ApiResponse(string error)
    {
        Success = false;
        Errors.Add(error);
    }

    public static ApiResponse<T> SuccessResult(T data) => new(data);
    public static ApiResponse<T> Failure(string error) => new(error);
}