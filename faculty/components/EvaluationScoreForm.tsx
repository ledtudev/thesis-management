import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  Slider as MuiSlider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { ProjectEvaluationScore } from '../services/evaluation.interface';

const scoreSchema = z.object({
  score: z.number().min(0).max(10).step(0.1),
  comment: z.string().optional(),
});

type ScoreFormData = z.infer<typeof scoreSchema>;

interface EvaluationScoreFormProps {
  onSubmit: (data: ScoreFormData) => void;
  isLoading: boolean;
  existingScore?: ProjectEvaluationScore;
  title?: string;
  subtitle?: string;
}

export default function EvaluationScoreForm({
  onSubmit,
  isLoading,
  existingScore,
  title = 'Chấm điểm dự án',
  subtitle,
}: EvaluationScoreFormProps) {
  const [sliderValue, setSliderValue] = useState(existingScore?.score || 7);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ScoreFormData>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      score: existingScore?.score || 7,
      comment: existingScore?.comment || '',
    },
  });

  const scoreMarks = [
    { value: 0, label: '0' },
    { value: 2.5, label: '2.5' },
    { value: 5, label: '5' },
    { value: 7.5, label: '7.5' },
    { value: 10, label: '10' },
  ];

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ p: 3, width: '100%' }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5">{title}</Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <FormControl fullWidth error={!!errors.score}>
          <InputLabel shrink htmlFor="score-slider">
            Điểm đánh giá
          </InputLabel>
          <Controller
            name="score"
            control={control}
            render={({ field }) => (
              <Box sx={{ pt: 3, pb: 1, px: 2 }}>
                <MuiSlider
                  id="score-slider"
                  value={sliderValue}
                  min={0}
                  max={10}
                  step={0.1}
                  marks={scoreMarks}
                  valueLabelDisplay="on"
                  onChange={(_, newValue) => {
                    const value = Array.isArray(newValue)
                      ? newValue[0]
                      : newValue;
                    setSliderValue(value);
                    field.onChange(value);
                  }}
                />
              </Box>
            )}
          />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <TextField
              type="number"
              value={sliderValue}
              inputProps={{
                min: 0,
                max: 10,
                step: 0.1,
              }}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0 && value <= 10) {
                  setSliderValue(value);
                }
              }}
              sx={{ width: '100px' }}
              size="small"
            />
            <Typography variant="body1">/10 điểm</Typography>
          </Stack>
          {errors.score && (
            <FormHelperText error>{errors.score.message}</FormHelperText>
          )}
        </FormControl>

        <FormControl fullWidth error={!!errors.comment}>
          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nhận xét"
                placeholder="Nhập nhận xét của bạn về dự án này..."
                multiline
                rows={5}
                error={!!errors.comment}
                helperText={errors.comment?.message}
              />
            )}
          />
        </FormControl>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" disabled={isLoading} type="submit">
            {existingScore ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
