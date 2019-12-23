using System.Collections.Generic;
using ccl_dotnet_angular.Models;

namespace ccl_dotnet_angular.Repositories
{
  public interface IQuayMooringInfoRepository
  {
    IEnumerable<QuayMooringInfo> GetQuayMooringInfoList();
    IEnumerable<QuayMooringInfo> GetQuayMooringInfoListByYearTyphoon(string year_tphn_no);
  }
}
