import { useAvailableOrdersQuery } from '@/redux/services/orderApi';

const OrderList = () => {
  const { data: orders, isLoading, isError } = useAvailableOrdersQuery(undefined);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching orders</div>;

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-xl font-semibold text-gray-800">Available Orders</h2>
      <div className="mt-4 space-y-4">
        {orders?.map((order:any) => (
          <div key={order.id} className="flex justify-between items-center border-b py-4">
            <div>
              <h3 className="text-lg font-semibold">{order.customerName}</h3>
              <p className="text-sm text-gray-500">Order ID: {order.id}</p>
            </div>
            <div>
              <button className="bg-blue-500 text-white p-2 rounded-xl">Accept</button>
              <button className="bg-red-500 text-white p-2 rounded-xl ml-2">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
