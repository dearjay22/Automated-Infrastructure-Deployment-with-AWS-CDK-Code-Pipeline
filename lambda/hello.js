exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Updated this code for test" }),
  };
};
