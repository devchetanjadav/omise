import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChargeService } from './charge.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
//import * as Omise from 'omise';
import Omise from 'omise';

const omise = Omise({
  secretKey: 'skey_test_6394uqh7l1xqvte1lwa',
  publicKey: 'pkey_test_6394uqgndt3tdsvsnks',
  omiseVersion: '2019-05-29'
});

@Controller('charge')
export class ChargeController {
  constructor(private readonly chargeService: ChargeService) {}

  @Post()
  async create(@Body() body: { amount: number; token: string; }) {
    //return this.chargeService.create(createChargeDto);

    try {
      const charge = await omise.charges.create({
        amount: body.amount * 100, // Omise uses the smallest currency unit
        currency: 'THB',
        card: body.token,
        capture: true, // Capture immediately (default)
      });

      console.log('Charge Captured:', charge);
      return {status:'success', message:"", data:{"chargeId":charge.id}}

    } catch (error) {
      console.error('Charge Error:', error);
      return {status:'error', message: error, data:{}}
    }
  }

  @Post('create')
  async createCharge(@Body() body: { amount: number; type: string; returnUri: string; token: string;  source: string; }) {
    //return this.chargeService.create(createChargeDto);

    try {

      let chargeId:string = '';
      let authorizeUri:string = '';

      if(body.type == 'card'){

        const charge = await omise.charges.create({
          amount: body.amount * 100, // Omise uses the smallest currency unit
          currency: 'THB',
          card: body.token,
          capture: true, // Capture immediately (default)
        });

        console.log('Charge Captured:', charge);
        chargeId = charge.id;

      }else{
        
        const charge = await omise.charges.create({
          amount: body.amount * 100, // Omise uses the smallest currency unit
          currency: 'THB',
          source: body.source, // Use token from frontend
          capture: true, // Capture immediately (default)
          return_uri: body.returnUri
        });

        console.log('Charge Captured:', charge);

        chargeId = charge.id;
        authorizeUri = charge.authorize_uri

      }

      return {status:'success', message: "", data:{"chargeId":chargeId, "authorizeUri":authorizeUri}}

    } catch (error) {
      console.error('Charge Error:', error);
      return {status:'error', message: error, data:{}}
    }
  }

  @Get()
  async findAll() {
    
    const token = await omise.tokens.create({
      card: {
        name: 'JOBY JOSH',
        city: 'Bangkok',
        postal_code: 10320,
        number: '4242424242424242',
        expiration_month: 3,
        expiration_year: 2028,
        security_code: "789",
      },
    });

    return token;
  }

  @Post('create-source')
  async createSource(@Body() body: { amount: number; type: string; returnUri: string }) {
    
    try {
      
      // Create a source for the selected payment method
      const source = await omise.sources.create({
        type: body.type, // 'truemoney', 'internet_banking_bbl', etc.
        amount: body.amount * 100, // Convert to smallest currency unit
        currency: 'THB',
      });

      const sourceRes = source;
      const sourceId = sourceRes.id
      //console.log('Created Source:', sourceId);
      
      const charge = await omise.charges.create({
        amount: body.amount * 100, // Omise uses the smallest currency unit
        currency: 'THB',
        source: sourceId, // Use token from frontend
        capture: true, // Capture immediately (default)
        return_uri: body.returnUri
      });

      const chargeRes = charge;
      const chargeId = chargeRes.id
      const authorizeUri = chargeRes.authorize_uri
      
      //console.log('Charge:', chargeRes);

      return {status:'success', message: "", data:{"chargeId":chargeId, "authorizeUri":authorizeUri}}

    } catch (error) {
      console.error('Omise Source Error:', error);
      return {status:'error', message: error, data:{}}
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chargeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChargeDto: UpdateChargeDto) {
    return this.chargeService.update(+id, updateChargeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chargeService.remove(+id);
  }
}
