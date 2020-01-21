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
          var query = "SELECT * FROM AP.NH820M";
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
          var query = "SELECT * FROM AP.NH820M WHERE YEAR_TPHN_NO = :YEAR_TPHN_NO ORDER BY MNTH_DATE DESC, REV_NUMB DESC";
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
      var connectionString = configuration.GetSection("ConnectionStrings").GetSection("oracleConnection").Value;
      var conn = new OracleConnection(connectionString);
      return conn;
    }
  }
}
