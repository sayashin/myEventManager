const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");

//getting the site settings
const getSettings = (callback) => {
  const query = "SELECT name, description FROM settings LIMIT 1";
  db.get(query, (err, row) => {
    if (err) {
      callback(err);
    } else {
      //return default values if no update
      callback(
        null,
        row || { name: "Default Name", description: "Default Description" }
      );
    }
  });
};

//site settings updates
const updateSettings = (name, description, callback) => {
  const query = `
    UPDATE settings
    SET name = ?, description = ?
    WHERE id = 1
  `;
  db.run(query, [name, description], (err) => {
    callback(err);
  });
};

//getting the draft events
const getDraftEvents = (callback) => {
  const query = `
    SELECT id, title, description, date, full_price_tickets, full_price_cost, concession_tickets, concession_cost, created_at, updated_at
    FROM events
    WHERE is_published = 0
      AND (description IS NOT NULL AND description != '')
      AND (date IS NOT NULL AND date != '')
      AND (full_price_tickets > 0 OR concession_tickets > 0)
  `;
  db.all(query, (err, rows) => {
    if (err) {
      //list of events return
      callback(err);
    } else {
      callback(null, rows);
    }
  });
};

//getting the published events and ticket availability
const getPublishedEvents = (callback) => {
  const query = `
    SELECT e.id, e.title, e.description, e.date, e.full_price_tickets AS total_full_price_tickets, e.concession_tickets AS total_concession_tickets, e.full_price_cost, e.concession_cost, e.created_at, e.updated_at,
    (e.full_price_tickets - COALESCE(SUM(b.full_price_tickets), 0)) AS remaining_full_price_tickets, (e.concession_tickets - COALESCE(SUM(b.concession_tickets), 0)) AS remaining_concession_tickets
    FROM events e
    LEFT JOIN bookings b ON e.id = b.event_id
    WHERE e.is_published = 1
    GROUP BY e.id
    ORDER BY e.date ASC
  `;
  db.all(query, (err, rows) => {
    if (err) {
      callback(err);
    } else {
      //list of events return
      callback(null, rows);
    }
  });
};

//set up a new draft event
const createDraftEvent = (callback) => {
  const query = `
    INSERT INTO events (title, description, date, full_price_tickets, full_price_cost, concession_tickets, concession_cost, is_published) 
    VALUES ('Draft Event', '', '', 0, 0.00, 0, 0.00, 0)`;
  db.run(query, function (err) {
    if (err) {
      callback(err);
    } else {
      // id event return
      callback(null, this.lastID);
    }
  });
};

//getting an event by id
const getEvent = (id, callback) => {
  const query = `
    SELECT e.id, e.title, e.description, e.date, e.full_price_tickets AS total_full_price_tickets, e.concession_tickets AS total_concession_tickets, e.full_price_cost, e.concession_cost,
    (e.full_price_tickets - COALESCE(SUM(b.full_price_tickets), 0)) AS remaining_full_price_tickets, (e.concession_tickets - COALESCE(SUM(b.concession_tickets), 0)) AS remaining_concession_tickets
    FROM events e
    LEFT JOIN bookings b ON e.id = b.event_id
    WHERE e.id = ?
    GROUP BY e.id
  `;
  db.get(query, [id], (err, row) => {
    if (err) {
      callback(err);
    } else {
      //event details return
      callback(null, row);
    }
  });
};

//events details updates
const updateEvent = (
  id,
  title,
  description,
  date,
  fullPriceTickets,
  fullPriceCost,
  concessionTickets,
  concessionCost,
  callback
) => {
  const query = `
    UPDATE events
    SET title = ?, description = ?, date = ?, full_price_tickets = ?, full_price_cost = ?, concession_tickets = ?, concession_cost = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const params = [
    title,
    description,
    date,
    fullPriceTickets,
    fullPriceCost,
    concessionTickets,
    concessionCost,
    id,
  ];

  db.run(query, params, (err) => {
    callback(err);
  });
};

//events booking tickets
const bookingTickets = (eventId, name, fullPrice, concession, callback) => {
  const checkAvailability = `
    SELECT e.full_price_tickets - COALESCE(SUM(b.full_price_tickets), 0) AS remaining_full_price_tickets, e.concession_tickets - COALESCE(SUM(b.concession_tickets), 0) AS remaining_concession_tickets
    FROM events e
    LEFT JOIN bookings b ON e.id = b.event_id
    WHERE e.id = ?
    GROUP BY e.id
  `;
  db.get(checkAvailability, [eventId], (err, availability) => {
    if (err) {
      callback(err);
    } else if (
      !availability ||
      availability.remaining_full_price_tickets < fullPrice ||
      availability.remaining_concession_tickets < concession
    ) {
      //Not enough tickets
      callback(null, false);
    } else {
      const recordBooking = `
        INSERT INTO bookings (event_id, attendee_name, full_price_tickets, concession_tickets)
        VALUES (?, ?, ?, ?)
      `;
      db.run(recordBooking, [eventId, name, fullPrice, concession], (err) => {
        if (err) {
          callback(err);
        } else {
          //Booking complete
          callback(null, true);
        }
      });
    }
  });
};

//delete events by id
const deleteEvent = (id, callback) => {
  const query = "DELETE FROM events WHERE id = ?";
  db.run(query, [id], (err) => {
    callback(err);
  });
};

//publish events by id
const publishEvent = (id, callback) => {
  const query = `
    UPDATE events
    SET is_published = 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.run(query, [id], (err) => {
    callback(err);
  });
};

//getting all bookings and order by date
const getBookings = (callback) => {
  const query = `
    SELECT b.id, b.attendee_name, b.full_price_tickets, b.concession_tickets, b.booking_date, e.title AS event_title, e.date AS event_date
    FROM bookings b
    JOIN events e ON b.event_id = e.id
    ORDER BY e.date ASC, b.booking_date DESC
  `;
  db.all(query, (err, rows) => {
    if (err) {
      callback(err);
    } else {
      callback(null, rows);
    }
  });
};

module.exports = {
  getSettings,
  updateSettings,
  getDraftEvents,
  getPublishedEvents,
  createDraftEvent,
  getEvent,
  updateEvent,
  bookingTickets,
  deleteEvent,
  publishEvent,
  getBookings,
};
