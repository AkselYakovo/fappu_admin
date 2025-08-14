export function getDaysLeft(dateString) {
  // let dateString = account.querySelector('.expiration-date').innerHTML;
  let warrantyBegan = new Date(dateString) // YYYY-MM-DD
  let warrantyEnds = new Date() // Today's Date..
  warrantyEnds.setTime(warrantyBegan.valueOf() + 86400000 * 28) // Plus 28 days..
  let daysLeft = warrantyEnds - new Date()
  // console.log(warrantyEnds);
  if (daysLeft > 0) return Math.ceil(daysLeft / 86400 / 1000) + " Days Left"
  else return "Expired Warranty"
}

export function getDaysAgo(dateString) {
  let originalWarranty = new Date(dateString)
  let today = new Date()
  let diff = Math.abs(originalWarranty - today)
  return Math.ceil(diff / 86400 / 1000) + " DAYS AGO"
}
