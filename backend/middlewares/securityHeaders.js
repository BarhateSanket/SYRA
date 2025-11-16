import helmet from "helmet";

const securityHeaders = helmet({
  contentSecurityPolicy: false, 
});

export const customSecurityHeaders = (req, res, next) => {
  res.removeHeader("X-Powered-By");
  next();
};

export default securityHeaders;
