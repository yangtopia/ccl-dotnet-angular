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
  public class QuayInfoRepository : IQuayInfoRepository
  {
    IConfiguration configuration;
    public QuayInfoRepository(IConfiguration _configuration)
    {
      configuration = _configuration;
    }

    public IEnumerable<QuayInfo> GetQuayInfoList()
    {
      IEnumerable<QuayInfo> result = null;
      try
      {
        var conn = this.GetConnection();
        if (conn.State == ConnectionState.Closed)
        {
          conn.Open();
        }

        if (conn.State == ConnectionState.Open)
        {
          var quayInfoTable = configuration.GetSection("OracleTables").GetSection("quayInfoTable").Value;
          var query = $"SELECT * FROM {quayInfoTable}";
          result = SqlMapper.Query<QuayInfo>(conn, query);
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
      var connectionInfos = configuration.GetSection("ConnectionInfos");
      var HOST = connectionInfos.GetSection("host").Value;
      var PORT = connectionInfos.GetSection("port").Value;
      var SERVICE_NAME = connectionInfos.GetSection("serviceName").Value;
      var USERNAME = connectionInfos.GetSection("userName").Value;
      var PASSWORD = connectionInfos.GetSection("password").Value;

      var connectionString = $"Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={HOST})(PORT={PORT}))(CONNECT_DATA=(SERVICE_NAME={SERVICE_NAME})));User ID={USERNAME};Password={PASSWORD}";
      var conn = new OracleConnection(connectionString);
      return conn;
    }
  }
}
