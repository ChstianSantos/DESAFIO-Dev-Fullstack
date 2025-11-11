using MediaApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MediaApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Media> Medias => Set<Media>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Media>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.FileName).HasMaxLength(300);
                entity.Property(e => e.FilePath).HasMaxLength(500);
                entity.Property(e => e.FileType).HasMaxLength(100);
                entity.Property(e => e.MediaType).HasMaxLength(50);
                entity.Property(e => e.Gallery).HasMaxLength(100); 
                
                // Configuração para SQLite
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
            });
        }
    }
}