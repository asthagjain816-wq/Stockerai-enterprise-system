const Card = ({ title, value }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow w-full">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default Card;