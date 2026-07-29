export const formatDate = (date) => {
  if (!date) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); //getMonth vraca redni broj mjeseca pa je zato +1 iza; sve pretvaramo u string jer padStart radi samo na stringovima; padStart na svaki string manji od dva znaka dodaje nulu na pocetak
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
