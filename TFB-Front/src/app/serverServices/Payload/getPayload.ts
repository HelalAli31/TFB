export default function getPayload() {
  const userToken = localStorage.getItem("token");
  let payload;
  if (userToken) {
    try {
      payload = userToken.split(".")[1];
      payload = JSON.parse(atob(payload));
      return payload;
    } catch (error) {
      console.log(error);
      if (payload == undefined) {
        localStorage.removeItem("token");
      }
    }
  }
}
