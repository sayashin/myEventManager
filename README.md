here i upload all the node modules. but in case you start from scatch you need to do this first:

first we need to run this commands:
-npm init
-npm install express --save
-npm install ejs --save
-npm install body-parser --save
-npm install sqlite3 --save
-npm fund
-npm run build-db-win
-npm run start
and then we can start using the site

I use tailwind for the CSS
need to updated by:
npx tailwindcss -i ./public/main.css -o ./public/tailwind.css --watch

My extension:
For the extension I included:

1-Various Ticket categories: Organizers can specify different ticket categories, such as Full-Price and Concession, with particular costs and availability.
The quantity of full-price and concession tickets, as well as their prices, can now be determined by the event organizers.
Added columns for full_price_tickets, full_price_cost, concession_tickets, and concession_cost after updating the database. To allow organizers to enter these details, the "Edit Event" page was modified.

2-Display of Remaining Tickets: This feature is very useful for monitoring sales and availability since it lets organizers and attendees know how many tickets of each category are left.
The number of tickets left for each type is displayed in real time for both organizers and guests. Using LEFT JOIN, I created SQL queries to determine the number of available tickets depending on reservations. displayed these values on the websites for the organizer and attendees.
To ensure that organizers and attendees always obtain the most recent information, the remaining tickets are constantly calculated.
Location of the code: File: lines 175–185 of routes/users.js. Lines 10–26 of the file views/bookings.ejs.

3-All Bookings Page for Organizers: Organizers are given a new page with all of the reservations for their events, arranged neatly per event. In an easy-to-read table, organizers can view all of the reservations made for their events, arranged by event.
To retrieve all reservations from the database, I created a new route (/organiser/bookings). used bookings.ejs to display this data in a neat, formatted table.
Location of the code: File: lines 175–185 of routes/users.js. Lines 10–26 of the file views/bookings.ejs.
