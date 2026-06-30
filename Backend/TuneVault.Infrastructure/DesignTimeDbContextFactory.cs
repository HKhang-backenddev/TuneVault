using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TuneVault.Infrastructure;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<TuneVaultDbContext>
{
    public TuneVaultDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<TuneVaultDbContext>();
        optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=TuneVault;Trusted_Connection=True;MultipleActiveResultSets=true");
        return new TuneVaultDbContext(optionsBuilder.Options);
    }
}
