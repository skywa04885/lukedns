import winston from "winston";
import path from "path";
import "winston-daily-rotate-file";

const error_log_filename: string = path.join(
  __dirname,
  "../",
  "logs",
  "error.log"
);

const daily_rotate_error_log_transport = new winston.transports.DailyRotateFile(
  {
    filename: error_log_filename,
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
  }
);

daily_rotate_error_log_transport.on("rotate", (old_filename, new_filename) => {
  console.log(
    `Rotating error log file, renaming ${old_filename} to ${new_filename}`
  );
});

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [daily_rotate_error_log_transport],
});
