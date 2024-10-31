const errorHandler = (err, req, res, next) => {
    console.log(err);
    res.status(500).render("500.ejs");
}

export default errorHandler