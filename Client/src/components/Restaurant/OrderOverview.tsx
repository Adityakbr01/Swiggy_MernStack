const OrderOverview = () => {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Order Overview</h2>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <div className="text-center bg-green-100 p-4 rounded-xl">
            <h3 className="text-lg font-medium">Total Orders</h3>
            <p className="text-2xl font-bold">350</p>
          </div>
          <div className="text-center bg-red-100 p-4 rounded-xl">
            <h3 className="text-lg font-medium">Pending Orders</h3>
            <p className="text-2xl font-bold">45</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default OrderOverview;
  