using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ccl_dotnet_angular.Repositories;
using ccl_dotnet_angular.Models;

namespace ccl_dotnet_angular.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeController : ControllerBase
    {
        IEmployeeRepository employeeRepository;
        public EmployeeController(IEmployeeRepository _employeeRepository)
        {
            employeeRepository = _employeeRepository;
        }

        [HttpGet]
        public IEnumerable<Employee> GetEmployeeList() {
            var result = employeeRepository.GetEmployeeList();
            return result;
        }

        [HttpGet("{empId}")]
        public IEnumerable<Employee> GetEmployeeDetailsById(int empId) {
            var result = employeeRepository.GetEmployeeDetails(empId);
            return result;
        }
    }
}
