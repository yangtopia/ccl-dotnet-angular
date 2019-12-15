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
  public class TyphoonInfoController : ControllerBase
  {
    ITyphoonInfoRepository typhoonInfoRepository;
    public TyphoonInfoController(ITyphoonInfoRepository _typhoonInfoRepository)
    {
      typhoonInfoRepository = _typhoonInfoRepository;
    }

    [HttpGet]
    public IEnumerable<TyphoonInfo> GetTyphoonInfoList()
    {
      var result = typhoonInfoRepository.GetTyphoonInfoList();
      return result;
    }
  }
}
