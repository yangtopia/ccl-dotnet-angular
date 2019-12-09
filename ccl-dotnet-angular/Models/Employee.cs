using System;

namespace ccl_dotnet_angular.Models
{
    public class Employee
    {
      public int employee_id { get; set; }
      public string first_name { get; set; }
      public string last_name { get; set; }
      public string email { get; set; }
      public string phone_number { get; set; }
      public DateTime hire_date { get; set; }

      public string job_id { get; set; }

      public int salary { get; set; }
      public int commission_pct { get; set; }
      public int manager_id { get; set; }
      public int department_id { get; set; }

    }
}
