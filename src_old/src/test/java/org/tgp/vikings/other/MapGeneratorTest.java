/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package org.tgp.vikings.other;

import org.json.JSONStringer;
import org.json.JSONWriter;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.tgp.vikings.enums.TerrainType;

/**
 *
 * @author Niko
 */
public class MapGeneratorTest {
   
   public MapGeneratorTest() {
   }
   
   @BeforeClass
   public static void setUpClass() {
   }
   
   @AfterClass
   public static void tearDownClass() {
   }
   
   @Before
   public void setUp() {
   }
   
   @After
   public void tearDown() {
   }

   /**
    * Test of getMap method, of class MapGenerator.
    */
   @Test
   public void testGetMap() {
      /*System.out.println("getMap");
      int width = 0;
      int height = 0;
      TerrainType[][] expResult = null;
      TerrainType[][] result = MapGenerator.getMap(width, height);
      assertArrayEquals(expResult, result);
      // TODO review the generated test code and remove the default call to fail.
      fail("The test case is a prototype.");*/
   }
   
   @Test
   public void test2(){
     


      JSONWriter responseJ = MapGenerator.getStringer();

      responseJ = responseJ.object()
              .key("status")
              .value("s")
              .key("statusMsg")
              .value("sm")
              .key("gameID")
              .value("gg")
              .endObject();

      System.out.println(responseJ.toString());
   }
}