using System;

namespace TuneVault.Domain;

public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; } 
    public string Type { get; set; } = string.Empty; 
    public string PayloadJson { get; set; } = string.Empty; 
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}
