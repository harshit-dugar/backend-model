const asyncHandler = (requestHandler) => {
  return(req,next,res) => {
    Promise.resolve(requestHandler(req,next,res))
      .catch((err) => next(err))
  }
}

export {asyncHandler}