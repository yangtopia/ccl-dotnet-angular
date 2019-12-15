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
  public class QuayMooringInfoController : ControllerBase
  {
    IQuayMooringInfoRepository quayMooringInfoRepository;
    public QuayMooringInfoController(IQuayMooringInfoRepository _quayMooringInfoRepository)
    {
      quayMooringInfoRepository = _quayMooringInfoRepository;
    }

    [HttpGet]
    public IEnumerable<QuayMooringInfo> GetQuayMooringInfoList()
    {
      var result = quayMooringInfoRepository.GetQuayMooringInfoList();
      return result;
    }
  }
}
