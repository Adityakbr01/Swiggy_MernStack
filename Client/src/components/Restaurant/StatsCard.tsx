const StatsCard = ({ title, value }: { title: string; value: string }) => {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-3xl font-bold text-gray-700">{value}</p>
      </div>
    );
  };
  
  export default StatsCard;
  