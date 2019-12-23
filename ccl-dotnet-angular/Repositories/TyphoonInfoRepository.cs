using ccl_dotnet_angular.Oracle;
using Dapper;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using System;
using System.Data;
using ccl_dotnet_angular.Models;

namespace ccl_dotnet_angular.Repositories
{
  public class TyphoonInfoRepository : ITyphoonInfoRepository
  {
    IConfiguration configuration;
    public TyphoonInfoRepository(IConfiguration _configuration)
    {
      configuration = _configuration;
    }

    public IEnumerable<TyphoonInfo> GetTyphoonInfoList()
    {
      IEnumerable<TyphoonInfo> result = null;
      try
      {
        var conn = this.GetConnection();
        if (conn.State == ConnectionState.Closed)
        {
          conn.Open();
        }

        if (conn.State == ConnectionState.Open)
        {
          var query = "SELECT * FROM NH800M ORDER BY YEAR DESC, TPHN_NO DESC";
          result = SqlMapper.Query<TyphoonInfo>(conn, query);
        }
      }
      catch (Exception ex)
      {
        throw ex;
      }

      return result;
    }

    public IDbConnection GetConnection()
    {
      var connectionString = configuration.GetSection("ConnectionStrings").GetSection("oracleConnection").Value;
      var conn = new OracleConnection(connectionString);
      return conn;
    }
  }
}
