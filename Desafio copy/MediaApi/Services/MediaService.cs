using MediaApi.Models;
using MediaApi.Data;
using Microsoft.EntityFrameworkCore;

namespace MediaApi.Services
{
    public class MediaService
    {
        private readonly AppDbContext _context;

        public MediaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Media>> GetAllAsync()
        {
            return await _context.Medias
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<Media?> GetByIdAsync(int id)
        {
            return await _context.Medias.FindAsync(id);
        }

        public async Task<Media> CreateAsync(Media media)
        {
            _context.Medias.Add(media);
            await _context.SaveChangesAsync();
            return media;
        }

        public async Task<Media?> UpdateAsync(int id, Media media)
        {
            var existingMedia = await _context.Medias.FindAsync(id);
            if (existingMedia == null) return null;

            
            if (!string.IsNullOrEmpty(media.Title))
                existingMedia.Title = media.Title;
                
            if (!string.IsNullOrEmpty(media.Description))
                existingMedia.Description = media.Description;
                
            if (!string.IsNullOrEmpty(media.FileName))
                existingMedia.FileName = media.FileName;
                
            if (!string.IsNullOrEmpty(media.FilePath))
                existingMedia.FilePath = media.FilePath;
                
            if (!string.IsNullOrEmpty(media.FileType))
                existingMedia.FileType = media.FileType;
                
            if (media.FileSize > 0)
                existingMedia.FileSize = media.FileSize;
                
            if (!string.IsNullOrEmpty(media.MediaType))
                existingMedia.MediaType = media.MediaType;

            if (media.Gallery != null)
                existingMedia.Gallery = media.Gallery;

            await _context.SaveChangesAsync();
            return existingMedia;
        }

        
        public async Task<List<Media>> GetByGalleryAsync(string galleryName)
        {
            return await _context.Medias
                .Where(m => m.Gallery == galleryName)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }

        
        public async Task<List<string>> GetAllGalleriesAsync()
        {
            return await _context.Medias
                .Where(m => !string.IsNullOrEmpty(m.Gallery))
                .Select(m => m.Gallery)
                .Distinct()
                .ToListAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var media = await _context.Medias.FindAsync(id);
            if (media == null) return false;

            _context.Medias.Remove(media);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}