//
//  ViewController.m
//  HyperImprovisation
//
//  Created by Garrett Parrish on 10/28/14.
//  Copyright (c) 2014 Garrett Parrish. All rights reserved.
//

#import "ViewController.h"

@interface ViewController () {
    UITextField *number;
}

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [[UIAccelerometer sharedAccelerometer]setDelegate:self];

    number = [[UITextField alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    number.placeholder = @"number";
    [self.view addSubview:number];
}

- (void)accelerometer:(UIAccelerometer *)accelerometer didAccelerate: (UIAcceleration *)acceleration{
//    NSLog(@"%@ | %@ | %@",[NSString stringWithFormat:@"%f",acceleration.x],[NSString stringWithFormat:@"%f",acceleration.y],[NSString stringWithFormat:@"%f",acceleration.z]);
    NSString *url = [NSString stringWithFormat:@"http://18.111.21.238:8888/?x=%f&y=%f&z=%f&n=%i",acceleration.x,acceleration.y,acceleration.z, [number.text intValue]];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:url]];
    [request setHTTPMethod: @"POST"];
    [NSURLConnection sendSynchronousRequest:request returningResponse:nil error:nil];
}

@end
