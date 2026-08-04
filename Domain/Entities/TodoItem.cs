namespace TodoApi.Domain.Entities
{
    public class TodoItem
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; 
        public DateTime? DueDate { get; set; }
        public Guid? RequestId { get; set; }
    }
}