const express = require("express");
const router = express.Router();
const db = require("../dataLogic");

// get the route and render the main home page
router.get("/", (req, res) => {
  res.render("mainHome.ejs");
});

//------Organiser pages-------

// get the route and render the organiser home page
router.get("/organiser", (req, res, next) => {
  db.getSettings((err, settings) => {
    if (err) {
      next(err);
    } else {
      db.getDraftEvents((err, drafts) => {
        if (err) {
          next(err);
        } else {
          db.getPublishedEvents((err, published) => {
            if (err) {
              next(err);
            } else {
              res.render("organiser.ejs", { settings, drafts, published });
            }
          });
        }
      });
    }
  });
});

// get the route and render the settings page
router.get("/organiser/settings", (req, res, next) => {
  db.getSettings((err, settings) => {
    if (err) {
      next(err);
    } else {
      res.render("settings.ejs", { settings });
    }
  });
});

// post the name and description of the page and goes to organiser page after updating
router.post("/organiser/settings", (req, res, next) => {
  const { name, description } = req.body;
  db.updateSettings(name, description, (err) => {
    if (err) {
      next(err);
    } else {
      res.redirect("/organiser");
    }
  });
});

// get the route and render the editEvent page and shows on the organiser page after create
router.get("/organiser/create", (req, res, next) => {
  db.createDraftEvent((err, eventId) => {
    if (err) {
      next(err);
    } else {
      res.redirect(`/organiser/edit/${eventId}`);
    }
  });
});

// get the route and render the editEvent page
router.get("/organiser/edit/:id", (req, res, next) => {
  const { id } = req.params;
  db.getEvent(id, (err, event) => {
    if (err) {
      next(err);
    } else {
      res.render("editEvent.ejs", { event });
    }
  });
});

// update the title, description, dates and prices of the event and goes to organiser page after updating
router.post("/organiser/edit/:id", (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    description,
    date,
    fullPriceTickets,
    fullPriceCost,
    concessionTickets,
    concessionCost,
  } = req.body;
  db.updateEvent(
    id,
    title,
    description,
    date,
    parseInt(fullPriceTickets, 10),
    parseFloat(fullPriceCost),
    parseInt(concessionTickets, 10),
    parseFloat(concessionCost),
    (err) => {
      if (err) {
        next(err);
      } else {
        res.redirect("/organiser");
      }
    }
  );
});

// publish the event by the id and redirect to organiser page
router.post("/organiser/publish/:id", (req, res, next) => {
  const { id } = req.params;
  db.publishEvent(id, (err) => {
    if (err) {
      next(err);
    } else {
      res.redirect("/organiser");
    }
  });
});

// delete the event by the id and redirect to organiser page
router.post("/organiser/delete/:id", (req, res, next) => {
  const { id } = req.params;
  db.deleteEvent(id, (err) => {
    if (err) {
      next(err);
    } else {
      res.redirect("/organiser");
    }
  });
});

// ------Attendee pages-------

// get the route and render the attendee home page
router.get("/attendee", (req, res, next) => {
  db.getSettings((err, settings) => {
    if (err) {
      next(err);
    } else {
      db.getPublishedEvents((err, events) => {
        if (err) {
          next(err);
        } else {
          res.render("attendee.ejs", { settings, events });
        }
      });
    }
  });
});

// get the route by the id and render the booking page
router.get("/attendee/event/:id", (req, res, next) => {
  const { id } = req.params;
  db.getEvent(id, (err, event) => {
    if (err) {
      next(err);
    } else if (!event) {
      res.status(404).send("Event not found");
    } else {
      res.render("booking.ejs", { event });
    }
  });
});

// post the booking to an event with tickets quantity and goes to attendees page after that
router.post("/attendee/event/:id/book", (req, res, next) => {
  const { id } = req.params;
  const { name, fullPrice, concession } = req.body;
  db.bookingTickets(
    id,
    name,
    parseInt(fullPrice, 10),
    parseInt(concession, 10),
    (err, success) => {
      if (err) {
        next(err);
      } else if (!success) {
        res.status(400).send("Not enough tickets available.");
      } else {
        res.redirect("/attendee");
      }
    }
  );
});

// get the route and render the all bookings page
router.get("/organiser/bookings", (req, res, next) => {
  db.getBookings((err, bookings) => {
    if (err) {
      next(err);
    } else {
      res.render("bookings.ejs", { bookings });
    }
  });
});

module.exports = router;
