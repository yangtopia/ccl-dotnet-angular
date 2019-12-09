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
    public class EmployeeRepository : IEmployeeRepository
    {
        IConfiguration configuration;
        public EmployeeRepository(IConfiguration _configuration)
        {
            configuration = _configuration;
        }
        public IEnumerable<Employee> GetEmployeeDetails(int empId)
        {
            IEnumerable<Employee> result = null;
            try
            {
                var dyParam = new OracleDynamicParameters();
                dyParam.Add("EMP_ID", OracleDbType.Int32, ParameterDirection.Input, empId);

                var conn = this.GetConnection();
                if (conn.State == ConnectionState.Closed)
                {
                    conn.Open();
                }

                if (conn.State == ConnectionState.Open)
                {
                    var query = "select * from employees where employee_id = :EMP_ID";
                    result = SqlMapper.Query<Employee>(conn, query, dyParam);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return result;
        }

        public IEnumerable<Employee> GetEmployeeList()
        {
            IEnumerable<Employee> result = null;
            try
            {
                var conn = this.GetConnection();
                if(conn.State == ConnectionState.Closed)
                {
                    conn.Open();
                }

                if (conn.State == ConnectionState.Open)
                {
                    var query = "select * from employees";
                    result = SqlMapper.Query<Employee>(conn, query);
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
            var connectionString = configuration.GetSection("ConnectionStrings").GetSection("EmployeeConnection").Value;
            var conn = new OracleConnection(connectionString);
            return conn;
        }
    }
}
