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
  public class QuayInfoController : ControllerBase
  {
    IQuayInfoRepository quayInfoRepository;
    public QuayInfoController(IQuayInfoRepository _quayInfoRepository)
    {
      quayInfoRepository = _quayInfoRepository;
    }

    [HttpGet]
    public IEnumerable<QuayInfo> GetQuayInfoList()
    {
      var result = quayInfoRepository.GetQuayInfoList();
      return result;
    }
  }
}
