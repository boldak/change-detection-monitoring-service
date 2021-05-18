import shapely
import numpy as np
import json
import shapely.wkt
from sentinelhub import BBox, CRS
import rasterio
from rasterio import features
from skimage.filters import sobel
from skimage.morphology import disk
from skimage.morphology import erosion, dilation, opening, closing, white_tophat
import geopandas as gpd

def get_bbox(polygon, inflate_bbox=0.1):
    """
    Determines the BBOX from polygon. BBOX is inflated in order to include polygon's surroundings. 
    """
    minx, miny, maxx, maxy = polygon.bounds
    delx=maxx-minx
    dely=maxy-miny

    minx=minx-delx*inflate_bbox
    maxx=maxx+delx*inflate_bbox
    miny=miny-dely*inflate_bbox
    maxy=maxy+dely*inflate_bbox
    
    return BBox(bbox=[minx, miny, maxx, maxy], crs=CRS.WGS84)


def get_simplified_poly(poly, simpl_fact = 0.0, simpl_step = 0.0001, threshold=20000):
    """
    Simplifies the polygon. Reduces the number of vertices.
    """
    while len(poly.wkt) > threshold:
        poly = poly.simplify(simpl_fact, preserve_topology=False)
        simpl_fact += simpl_step
            
    return poly
    
def mask_to_polygons_layer1(water_mask, patch, dam_poly, simplify=True):
    """
    Returns the polygon of measured water extent.
    """
#     src_transform = rasterio.transform.from_bounds(*dam_bbox.get_lower_left(),
#                                                    *dam_bbox.get_upper_right(),
#                                                    width=water_mask.shape[1],
#                                                    height=water_mask.shape[0])
   

    bbox = patch.bbox
    size_x = patch.meta_info['size_x']
    size_y = patch.meta_info['size_y']
    
    vx = bbox.min_x
    vy = bbox.max_y #-bbox.min_y #bbox.min_y
    cx = (bbox.max_x-bbox.min_x)/size_x
    cy = (bbox.max_y-bbox.min_y)/size_y
        
    src_transform = rasterio.Affine(cx, 0.0, vx, 0.0, -cy, vy)
    
    # do vectorization of raster mask
    results = ({'properties': {'raster_val': v}, 'geometry': s} 
               for i, (s, v) in enumerate(rasterio.features.shapes(water_mask.astype(np.int16),  transform=src_transform)) if v==1)
    
    geoms = list(results)
    if len(geoms)==0:
        return Point(0,0), 0, 0

    gpd_polygonized_raster = gpd.GeoDataFrame.from_features(geoms)
    intrscts_idx = gpd_polygonized_raster.index[(gpd_polygonized_raster.intersects(dam_poly)==True)] 
    
    measured_water_extent = gpd_polygonized_raster.loc[intrscts_idx].cascaded_union
    measured_water_extent = measured_water_extent.buffer(0)
    
    if simplify:
        measured_water_extent = get_simplified_poly(measured_water_extent, 0.0, 0.0001, min(100000, len(dam_poly.wkt)*100))
    
    return measured_water_extent



def mask_to_polygons_layer(mask, eopatch, tolerance):
    
    all_polygons = []
    bbox = eopatch.bbox
    size_x = eopatch.meta_info['size_x']
    size_y = eopatch.meta_info['size_y']
    
    vx = bbox.min_x
    vy = bbox.max_y
    cx = (bbox.max_x-bbox.min_x)/size_x
    cy = (bbox.max_y-bbox.min_y)/size_y
    
    for shape, value in features.shapes(mask.astype(np.int16), mask=(mask == 1), transform=rasterio.Affine(cx, 0.0, vx,
       0.0, -cy, vy)): 
        return shapely.geometry.shape(shape).simplify(tolerance, False)
        all_polygons.append(shapely.geometry.shape(shape))
    
    all_polygons = shapely.geometry.MultiPolygon(all_polygons)
    if not all_polygons.is_valid:
        all_polygons = all_polygons.buffer(0)
        if all_polygons.type == 'Polygon':
            all_polygons = shapely.geometry.MultiPolygon([all_polygons])
    return all_polygons

def toGeoJson (shape):
    return json.dumps(shapely.geometry.mapping(shape))

def get_observed_shape(eopatch, dam_poly, idx):
    ratio = np.abs(eopatch.bbox.max_x - eopatch.bbox.min_x) / np.abs(eopatch.bbox.max_y - eopatch.bbox.min_y)
    
    tolerance = 0.00025
    
    observed = eopatch.mask['WATER_MASK'][idx,...,0]
    observed = dilation(observed)
    observed = np.ma.masked_where(observed == False, observed)
    observedShape = mask_to_polygons_layer1(observed, eopatch, dam_poly)
    return shapely.geometry.mapping(observedShape)