const RecentActivity = () => {
    const activities = [
      "Order #123 placed",
      "Order #124 accepted by rider",
      "Order #125 completed",
    ];
  
    return (
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
        <ul className="mt-4 space-y-2">
          {activities.map((activity, index) => (
            <li key={index} className="text-sm text-gray-600">{activity}</li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default RecentActivity;
  