using Microsoft.EntityFrameworkCore;
using MediaApi.Data;
using MediaApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Conexão com banco (SQLite local)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Adiciona CORS para permitir o frontend (React)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Injetar o serviço
builder.Services.AddScoped<MediaService>();

var app = builder.Build();

// 🔥 ADICIONE ESTE CÓDIGO PARA CRIAR/RECRIAR O BANCO
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated(); // Cria o banco se não existir
}

// Configure o pipeline HTTP
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();