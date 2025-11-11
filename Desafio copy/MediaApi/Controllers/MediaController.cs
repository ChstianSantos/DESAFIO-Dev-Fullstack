using Microsoft.AspNetCore.Mvc;
using MediaApi.Models;
using MediaApi.Services;

namespace MediaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MediaController : ControllerBase
{
    private readonly MediaService _service;
    private readonly IWebHostEnvironment _environment;
    private readonly string[] _allowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
    private readonly string[] _allowedVideoExtensions = { ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm" };
    private readonly long _maxFileSize = 100 * 1024 * 1024; // 100MB

    public MediaController(MediaService service, IWebHostEnvironment environment)
    {
        _service = service;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var medias = await _service.GetAllAsync();
        return Ok(medias);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var media = await _service.GetByIdAsync(id);
        if (media == null) return NotFound();
        return Ok(media);
    }

    [HttpPost("link")]
    [Consumes("application/json")]
    public async Task<IActionResult> CreateFromLink([FromBody] Media media)
    {
        if (string.IsNullOrWhiteSpace(media.FilePath))
            return BadRequest("O campo 'FilePath' é obrigatório para upload via link.");

        try
        {
            if (!Uri.TryCreate(media.FilePath, UriKind.Absolute, out _))
                return BadRequest("URL fornecida é inválida.");

            var fileName = Path.GetFileName(media.FilePath);
            var fileType = GetFileTypeFromUrl(media.FilePath);
            var extension = Path.GetExtension(fileName)?.ToLowerInvariant();

            var newMedia = new Media
            {
                Title = media.Title ?? "Arquivo via link",
                Description = media.Description,
                FilePath = media.FilePath,
                FileName = fileName,
                FileType = fileType,
                FileSize = 0,
                MediaType = GetMediaTypeFromExtension(extension)
            };

            var created = await _service.CreateAsync(newMedia);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create(
        [FromForm] IFormFile? file,
        [FromForm] string title,
        [FromForm] string? description = null,
        [FromForm] string? FilePath = null)
    {
        try
        {
            // Upload via link
            if (file == null && !string.IsNullOrEmpty(FilePath))
            {
                return await HandleLinkUpload(FilePath, title, description);
            }

            // Upload de arquivo
            if (file != null && file.Length > 0)
            {
                return await HandleFileUpload(file, title, description);
            }

            return BadRequest("Nenhum arquivo ou link válido fornecido.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    private async Task<IActionResult> HandleLinkUpload(string FilePath, string title, string? description)
    {
        if (!Uri.TryCreate(FilePath, UriKind.Absolute, out _))
            return BadRequest("URL fornecida é inválida.");

        var fileName = Path.GetFileName(FilePath);
        var fileType = GetFileTypeFromUrl(FilePath);
        var extension = Path.GetExtension(fileName)?.ToLowerInvariant();

        var mediaLink = new Media
        {
            Title = title ?? "Arquivo via link",
            Description = description ?? "",
            FileName = fileName,
            FileType = fileType,
            FileSize = 0,
            FilePath = FilePath,
            MediaType = GetMediaTypeFromExtension(extension)
        };

        var createdLink = await _service.CreateAsync(mediaLink);
        return CreatedAtAction(nameof(GetById), new { id = createdLink.Id }, createdLink);
    }

    private async Task<IActionResult> HandleFileUpload(IFormFile file, string title, string? description)
    {
        if (file.Length > _maxFileSize)
            return BadRequest($"Arquivo muito grande. Tamanho máximo permitido: {_maxFileSize / (1024 * 1024)}MB");

        var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
        if (string.IsNullOrEmpty(extension) ||
            (!_allowedImageExtensions.Contains(extension) && !_allowedVideoExtensions.Contains(extension)))
        {
            return BadRequest($"Tipo de arquivo não permitido. Extensões permitidas: " +
                            $"{string.Join(", ", _allowedImageExtensions.Concat(_allowedVideoExtensions))}");
        }

        // GARANTIR que esta usando wwwroot/uploads
        var uploadDir = Path.Combine(_environment.WebRootPath, "uploads");
        if (!Directory.Exists(uploadDir))
        {
            Directory.CreateDirectory(uploadDir);
            Console.WriteLine($"✅ Pasta uploads criada em: {uploadDir}");
        }

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        Console.WriteLine($"✅ Arquivo salvo em: {filePath}");

        var mediaType = GetMediaTypeFromExtension(extension);

        var media = new Media
        {
            Title = title ?? Path.GetFileNameWithoutExtension(file.FileName),
            Description = description ?? "",
            FileName = fileName,
            FileType = file.ContentType,
            FileSize = file.Length,
            FilePath = $"/uploads/{fileName}", // agora simmmmm,URL correta para acesso
            MediaType = mediaType
        };

        var created = await _service.CreateAsync(media);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    private string GetFileTypeFromUrl(string url)
    {
        var extension = Path.GetExtension(url)?.ToLowerInvariant();
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".bmp" => "image/bmp",
            ".webp" => "image/webp",
            ".mp4" => "video/mp4",
            ".avi" => "video/x-msvideo",
            ".mov" => "video/quicktime",
            ".wmv" => "video/x-ms-wmv",
            ".flv" => "video/x-flv",
            ".webm" => "video/webm",
            _ => "link/url"
        };
    }

    private string GetMediaTypeFromExtension(string? extension)
    {
        if (string.IsNullOrEmpty(extension)) return "other";

        return _allowedImageExtensions.Contains(extension) ? "image" :
               _allowedVideoExtensions.Contains(extension) ? "video" : "other";
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Media media)
    {
        var updated = await _service.UpdateAsync(id, media);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var media = await _service.GetByIdAsync(id);
            if (media == null) return NotFound();

            // Remove arquivo físico se existir em wwwroot/uploads
#pragma warning disable CS8602 
            if (!string.IsNullOrEmpty(media.FileName) && !media.FilePath.StartsWith("http"))
            {
                var filePath = Path.Combine(_environment.WebRootPath, "uploads", media.FileName);
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    Console.WriteLine($"🗑️ Arquivo deletado: {filePath}");
                }
            }
#pragma warning restore CS8602 

            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro ao deletar mídia: {ex.Message}");
        }
    }


    [HttpGet("gallery/{galleryName}")]
    public async Task<IActionResult> GetByGallery(string galleryName)
    {
        try
        {
            var allMedias = await _service.GetAllAsync();
            var galleryMedias = allMedias.Where(m => m.Gallery == galleryName).ToList();
            return Ok(galleryMedias);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpGet("galleries")]
    public async Task<IActionResult> GetAllGalleries()
    {
        try
        {
            var allMedias = await _service.GetAllAsync();
            var galleries = allMedias
                .Where(m => !string.IsNullOrEmpty(m.Gallery))
                .Select(m => m.Gallery)
                .Distinct()
                .ToList();
            return Ok(galleries);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }
}

