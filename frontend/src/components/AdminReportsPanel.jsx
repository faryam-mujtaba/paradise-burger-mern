import { useEffect, useState } from "react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

function AdminReportsPanel({ token }) {
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [todayReport, setTodayReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [lastMonthReport, setLastMonthReport] = useState(null);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleString();
  };

  const fetchReports = async () => {
    try {
      setLoading(true);

      const [todayRes, monthRes, lastMonthRes] = await Promise.all([
        api.get("/admin/reports/today", authConfig),
        api.get(`/admin/reports/monthly?month=${selectedMonth}`, authConfig),
        api.get("/admin/reports/last-month", authConfig),
      ]);

      setTodayReport(todayRes.data.data);
      setMonthlyReport(monthRes.data.data);
      setLastMonthReport(lastMonthRes.data.data);
    } catch (error) {
      showNotification(
        "Report error",
        "error",
        error.response?.data?.message || "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedMonth]);

  const downloadCsv = async (type) => {
    try {
      const endpoint =
        type === "today"
          ? "/admin/reports/export/today"
          : `/admin/reports/export/monthly?month=${selectedMonth}`;

      const response = await api.get(endpoint, {
        ...authConfig,
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download =
        type === "today"
          ? "paradise-burger-today-report.csv"
          : `paradise-burger-monthly-report-${selectedMonth}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      showNotification("Download started", "success", "CSV report downloaded");
    } catch (error) {
      showNotification(
        "Download failed",
        "error",
        error.response?.data?.message || "Failed to download CSV"
      );
    }
  };

  const renderTopList = (title, items) => (
    <div className="admin-report-list">
      <h4>{title}</h4>

      {!items || items.length === 0 ? (
        <p>No sales data found.</p>
      ) : (
        items.slice(0, 5).map((item, index) => (
          <div className="admin-report-list-row" key={`${item.name}-${index}`}>
            <div>
              <strong>
                {index + 1}. {item.name}
              </strong>
              <span>Quantity sold: {item.quantity}</span>
            </div>

            <b>{formatMoney(item.revenue)}</b>
          </div>
        ))
      )}
    </div>
  );

  const renderReportCard = (title, report, type) => {
    if (!report) return null;

    return (
      <div className="admin-report-card">
        <div className="admin-report-card-header">
          <div>
            <span>{type === "today" ? "Daily Shift" : "Monthly Report"}</span>
            <h3>{title}</h3>
            <p>
              {formatDateTime(report.period?.start)} →{" "}
              {formatDateTime(report.period?.end)}
            </p>
          </div>

          {(type === "today" || type === "month") && (
            <button type="button" onClick={() => downloadCsv(type)}>
              Download CSV
            </button>
          )}
        </div>

        <div className="admin-report-stats">
          <div>
            <strong>{report.summary?.totalOrders || 0}</strong>
            <span>Total Orders</span>
          </div>

          <div>
            <strong>{report.summary?.delivered || 0}</strong>
            <span>Delivered</span>
          </div>

          <div>
            <strong>{report.summary?.pending || 0}</strong>
            <span>Pending</span>
          </div>

          <div>
            <strong>{formatMoney(report.summary?.totalSales)}</strong>
            <span>Total Sales</span>
          </div>

          <div>
            <strong>
              {formatMoney(report.summary?.averageDeliveredOrderValue)}
            </strong>
            <span>Avg Delivered Order</span>
          </div>
        </div>

        <div className="admin-report-breakdown">
          {renderTopList("Top Selling Menu Items", report.topMenuItems)}
          {renderTopList("Top Selling Deals", report.topDeals)}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-reports-panel">
        <p>Loading order reports...</p>
      </div>
    );
  }

  return (
    <div className="admin-reports-panel">
      <div className="admin-reports-top">
        <div>
          <span className="admin-report-kicker">Order Summary</span>
          <h2>Sales & Order Reports</h2>
          <p>
            Daily report follows your shop business shift timing, for example
            5:00 PM to 5:00 AM.
          </p>
        </div>

        <div className="admin-month-picker">
          <label>Select Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-reports-grid">
        {renderReportCard("Today Business Shift", todayReport, "today")}
        {renderReportCard(`Monthly Report ${selectedMonth}`, monthlyReport, "month")}
        {renderReportCard("Last Month Summary", lastMonthReport, "lastMonth")}
      </div>
    </div>
  );
}

export default AdminReportsPanel;