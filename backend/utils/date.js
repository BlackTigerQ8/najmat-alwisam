const getMonthDateRange = () => {
  const currentDate = new Date();

  // Get the first day of the current month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  // Get the first day of the next month
  const firstDayOfNextMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  );

  return { startDate: firstDayOfMonth, endDate: firstDayOfNextMonth };
};

module.exports = { getMonthDateRange };
