import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;
import java.text.ParseException; 
import com.google.sps.data.TimeHandler;
import org.json.JSONObject;

public class TimeHandlerTest {

  public static final String YEAR_2020_07_15 = "2020-07-15";
  public static final String YEAR_2020_06_15 = "2020-06-15";
  public static final String YEAR_5001_09_17 = "5001-09-17";
  public static final String YEAR_2020_07_16 = "2020-07-16";

  public static final String TIME_1_00 = "01:00";
  public static final String TIME_12_00 = "12:00";
  public static final String TIME_14_00 = "14:00";
  public static final String TIME_5_00 = "05:00";
  public static final String TIME_19_00 = "19:00";

  public static final String PACIFIC_DAYLIGHT = "PDT";
  public static final String CENTRAL_DAYLIGHT = "CDT";

  JSONObject json = new JSONObject();

  @Test
  public void parseInputDateTimeTest() throws ParseException {
    Date actualDateTime = TimeHandler.parseInputDateTime(YEAR_2020_07_15, TIME_14_00, PACIFIC_DAYLIGHT, json);
    
    SimpleDateFormat formatter = new SimpleDateFormat("MM-dd-yyyy HH:mm z");
    formatter.setTimeZone(TimeZone.getTimeZone(PACIFIC_DAYLIGHT));
    Date expectedDateTime = formatter.parse("07-15-2020 14:00 PDT");
  
    Assert.assertEquals(expectedDateTime, actualDateTime);
  }

  @Test 
  public void parseInputDateTest() throws ParseException {
    Date actualDate = TimeHandler.parseInputDate(YEAR_2020_06_15, json);

    SimpleDateFormat formatter = new SimpleDateFormat("MM-dd-yyyy");
    Date expectedDate = formatter.parse("06-15-2020");
  
    Assert.assertEquals(expectedDate, actualDate);
  }

  @Test 
  public void getTimeDisplayTestAM() {
    String actualTime = TimeHandler.getTimeDisplay(TIME_5_00);
    Assert.assertEquals("5:00am", actualTime);
  }

  @Test 
  public void getTimeDisplayTestPM() {
    String actualTime = TimeHandler.getTimeDisplay(TIME_19_00);
    Assert.assertEquals("7:00pm", actualTime);
  }

  @Test 
  public void createDateTimeDisplayDifferentDaysTest() {
    String startTime = TimeHandler.getTimeDisplay(TIME_1_00);
    String endTime = TimeHandler.getTimeDisplay(TIME_5_00);
    Date startDate = TimeHandler.parseInputDate(YEAR_2020_06_15, json);
    Date endDate = TimeHandler.parseInputDate(YEAR_2020_07_15, json);

    String actualDisplay = TimeHandler.createDateTimeDisplay(startDate, startTime, 
        endDate, endTime, PACIFIC_DAYLIGHT);
    Assert.assertEquals("Mon Jun 15, 2020, 1:00am - Wed Jul 15, 2020, 5:00am PDT", actualDisplay);
  } 

  @Test 
  public void createDateTimeDisplaySameDayTest() {
    String startTime = TimeHandler.getTimeDisplay(TIME_12_00);
    String endTime = TimeHandler.getTimeDisplay(TIME_14_00);
    Date startDate = TimeHandler.parseInputDate(YEAR_2020_07_15, json);
    Date endDate = TimeHandler.parseInputDate(YEAR_2020_07_15, json);

    String actualDisplay = TimeHandler.createDateTimeDisplay(startDate, startTime, 
        endDate, endTime, CENTRAL_DAYLIGHT);

    Assert.assertEquals("Wed Jul 15, 2020, 12:00pm - 2:00pm CDT", actualDisplay);
  }

  @Test
  public void verifyDateTimesGood() {
    Date startDateTime = TimeHandler.parseInputDateTime(YEAR_2020_06_15, TIME_12_00, PACIFIC_DAYLIGHT, json);
    Date endDateTime = TimeHandler.parseInputDateTime(YEAR_2020_07_15, TIME_12_00, PACIFIC_DAYLIGHT, json);

    boolean actual = TimeHandler.verifyDateTimes(startDateTime, endDateTime, json);
    Assert.assertEquals(true, actual);
  }

  @Test
  public void verifyDateTimesBadDiffDays() {
    Date startDateTime = TimeHandler.parseInputDateTime(YEAR_2020_07_15, TIME_12_00, PACIFIC_DAYLIGHT, json);
    Date endDateTime = TimeHandler.parseInputDateTime(YEAR_2020_06_15, TIME_12_00, PACIFIC_DAYLIGHT, json);

    boolean actual = TimeHandler.verifyDateTimes(startDateTime, endDateTime, json);
    Assert.assertEquals(false, actual);
  }

  @Test
  public void verifyDateTimesBadSameDay() {
    Date startDateTime = TimeHandler.parseInputDateTime(YEAR_2020_07_15, TIME_12_00, PACIFIC_DAYLIGHT, json);
    Date endDateTime = TimeHandler.parseInputDateTime(YEAR_2020_07_15, TIME_5_00, PACIFIC_DAYLIGHT, json);

    boolean actual = TimeHandler.verifyDateTimes(startDateTime, endDateTime, json);
    Assert.assertEquals(false, actual);
  }

  @Test
  public void verifyDateTimesBadSameDateTime() {
    Date startDateTime = TimeHandler.parseInputDateTime(YEAR_5001_09_17, TIME_5_00, PACIFIC_DAYLIGHT, json);
    Date endDateTime = TimeHandler.parseInputDateTime(YEAR_5001_09_17, TIME_5_00, PACIFIC_DAYLIGHT, json);

    boolean actual = TimeHandler.verifyDateTimes(startDateTime, endDateTime, json);
    Assert.assertEquals(false, actual);
  }

  @Test
  public void eventNotCurrent() {
    Date endDateTime = TimeHandler.parseInputDateTime(YEAR_2020_07_15, TIME_5_00, PACIFIC_DAYLIGHT, json);

    String actual = TimeHandler.eventCurrency(endDateTime, PACIFIC_DAYLIGHT);
    Assert.assertEquals("past", actual);
  }

  @Test
  public void eventIsCurrent() {
    Date endDateTime = TimeHandler.parseInputDateTime(YEAR_5001_09_17, TIME_5_00, PACIFIC_DAYLIGHT, json);

    String actual = TimeHandler.eventCurrency(endDateTime, PACIFIC_DAYLIGHT);
    Assert.assertEquals("current", actual);
  }
}