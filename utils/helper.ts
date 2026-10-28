export class Helper {
  static convertPriceToNumber(price: string): number {
    return Number(price.replace(/[^0-9.]/g, ""));
  }

  static getProductDetails() {
    return {
      productName: "MacBook",
      productQuantity: "1",
      totalPrice: "$602.00",
    };
  }

  static getLoginDetails() {
    return {
      email: "rmanthena2007@gmail.com",
      password: "Siripriya@123",
    };
  }
}