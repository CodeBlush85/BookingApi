import { PrismaClient } from "@prisma/client";

import users from "../src/data/users.json" with { type: "json" };
import hosts from "../src/data/hosts.json" with { type: "json" };
import properties from "../src/data/properties.json" with { type: "json" };
import bookings from "../src/data/bookings.json" with { type: "json" };
import reviews from "../src/data/reviews.json" with { type: "json" };

const prisma = new PrismaClient();

async function main() {


  // USERS
  for (const user of users.users) {
    await prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password
      }
    });
  }

  // HOSTS
  for (const host of hosts.hosts) {
    await prisma.host.create({
      data: {
        id: host.id,
        name: host.name
      }
    });
  }

  // PROPERTIES
  for (const property of properties.properties) {
    await prisma.property.create({
      data: {
        id: property.id,
        title: property.title,
        location: property.location,
        pricePerNight: property.pricePerNight,
        hostId: property.hostId
      }
    });
  }

  // BOOKINGS
  for (const booking of bookings.bookings) {
    await prisma.booking.create({
      data: {
        id: booking.id,
        userId: booking.userId,
        propertyId: booking.propertyId,
        totalPrice: booking.totalPrice
      }
    });
  }

  // REVIEWS
  for (const review of reviews.reviews) {
    await prisma.review.create({
      data: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userId: review.userId,
        propertyId: review.propertyId
      }
    });
  }


}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });