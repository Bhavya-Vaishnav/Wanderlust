const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {reviewSchema}=require("../schema.js");


function validateReview(req, res, next) {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const errmsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errmsg);
    } else {
      next();
    }
  }


// Reviews Post route
router.post(
    "/",
    validateReview,
    wrapAsync(async (req, res) => {
      const listing = await Listing.findById(req.params.id);
      const newReview = new Review(req.body.review);
      listing.reviews.push(newReview);
  
      await newReview.save();
      await listing.save();
      req.flash("success","New Review Added Successfully!");
      res.redirect(`/listings/${listing._id}`);
    })
  );
  
  // Reviews Delete route
  router.delete("/:reviewid",
  wrapAsync(async (req, res) => {
      let { id, reviewid } = req.params;
      await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
      await Review.findByIdAndDelete(reviewid);
      req.flash("success","Review Deleted Successfully!");
      res.redirect(`/listings/${id}`);
  }));

  module.exports = router;