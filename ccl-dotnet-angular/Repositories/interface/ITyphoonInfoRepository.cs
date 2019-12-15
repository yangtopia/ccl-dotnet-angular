using System.Collections.Generic;
using ccl_dotnet_angular.Models;

namespace ccl_dotnet_angular.Repositories
{
  public interface ITyphoonInfoRepository
  {
    IEnumerable<TyphoonInfo> GetTyphoonInfoList();
  }
}
