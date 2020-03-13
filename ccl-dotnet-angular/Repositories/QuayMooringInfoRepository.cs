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
  public class QuayMooringInfoRepository : IQuayMooringInfoRepository
  {
    IConfiguration configuration;
    public QuayMooringInfoRepository(IConfiguration _configuration)
    {
      configuration = _configuration;
    }

    public IEnumerable<QuayMooringInfo> GetQuayMooringInfoList()
    {
      IEnumerable<QuayMooringInfo> result = null;
      try
      {
        var conn = this.GetConnection();
        if (conn.State == ConnectionState.Closed)
        {
          conn.Open();
        }

        if (conn.State == ConnectionState.Open)
        {
          var quayMooringInfoTable = configuration.GetSection("OracleTables").GetSection("quayMooringInfoTable").Value;
          var query = $"SELECT * FROM {quayMooringInfoTable}";
          result = SqlMapper.Query<QuayMooringInfo>(conn, query);
        }
      }
      catch (Exception ex)
      {
        throw ex;
      }

      return result;
    }

    public IEnumerable<QuayMooringInfo> GetQuayMooringInfoListByYearTyphoon(string year_tphn_no)
    {
      IEnumerable<QuayMooringInfo> result = null;
      try
      {

        var dyParam = new OracleDynamicParameters();
        dyParam.Add("YEAR_TPHN_NO", OracleDbType.Varchar2, ParameterDirection.Input, year_tphn_no);

        var conn = this.GetConnection();
        if (conn.State == ConnectionState.Closed)
        {
          conn.Open();
        }

        if (conn.State == ConnectionState.Open)
        {
          var quayMooringInfoTable = configuration.GetSection("OracleTables").GetSection("quayMooringInfoTable").Value;
          var query = $"SELECT * FROM {quayMooringInfoTable} WHERE YEAR_TPHN_NO = :YEAR_TPHN_NO ORDER BY MNTH_DATE DESC, REV_NUMB DESC";
          result = SqlMapper.Query<QuayMooringInfo>(conn, query, dyParam);
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
