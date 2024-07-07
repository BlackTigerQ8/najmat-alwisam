const getMonthDateRange = () => {
  const currentDate = new Date();

  // Get the first day of the current month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  // Get the last day of the current month
  const lastDayOfCurrentMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    31
  );

  return { startDate: firstDayOfMonth, endDate: lastDayOfCurrentMonth };
};

module.exports = { getMonthDateRange };
